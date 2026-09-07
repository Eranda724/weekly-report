const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const TEST_EMAILS = {
    member: 'rbac-test-member@test.com',
    otherMember: 'rbac-test-other-member@test.com',
    manager: 'rbac-test-manager@test.com',
    admin: 'rbac-test-admin@test.com',
};

let memberToken, otherMemberToken, managerToken, adminToken;
let memberReportId;
let testProjectId;

beforeAll(async () => {
    // Clean up any leftovers from a previous failed run
    await prisma.user.deleteMany({ where: { email: { in: Object.values(TEST_EMAILS) } } });

    // Create a team member via the real register endpoint (exercises that flow too)
    const memberRes = await request(app).post('/api/auth/register').send({
        name: 'RBAC Test Member',
        email: TEST_EMAILS.member,
        password: 'password123',
    });
    memberToken = memberRes.body.token;

    const otherMemberRes = await request(app).post('/api/auth/register').send({
        name: 'RBAC Test Other Member',
        email: TEST_EMAILS.otherMember,
        password: 'password123',
    });
    otherMemberToken = otherMemberRes.body.token;

    // Manager and Admin can't self-register with that role, so create directly
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.create({
        data: { name: 'RBAC Test Manager', email: TEST_EMAILS.manager, passwordHash, role: 'MANAGER' },
    });
    await prisma.user.create({
        data: { name: 'RBAC Test Admin', email: TEST_EMAILS.admin, passwordHash, role: 'ADMIN' },
    });

    const managerLogin = await request(app).post('/api/auth/login').send({
        email: TEST_EMAILS.manager, password: 'password123',
    });
    managerToken = managerLogin.body.token;

    const adminLogin = await request(app).post('/api/auth/login').send({
        email: TEST_EMAILS.admin, password: 'password123',
    });
    adminToken = adminLogin.body.token;

    // Create a project as manager, and a report as the team member, to test ownership on
    const projectRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'RBAC Test Project' });
    testProjectId = projectRes.body.id;

    const reportRes = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
            projectId: testProjectId,
            weekStartDate: '2026-01-05',
            tasksNextWeek: 'test',
            notesLinks: '',
            tasks: [],
            highlights: [],
            hoursBreakdown: [],
        });
    memberReportId = reportRes.body.id;
});

afterAll(async () => {
    // Clean up everything created for this test run
    await prisma.report.deleteMany({ where: { userId: { in: [] } } }); // safety no-op if IDs unknown
    if (memberReportId) {
        await prisma.report.delete({ where: { id: memberReportId } }).catch(() => { });
    }
    if (testProjectId) {
        await prisma.project.delete({ where: { id: testProjectId } }).catch(() => { });
    }
    await prisma.user.deleteMany({ where: { email: { in: Object.values(TEST_EMAILS) } } });
    await prisma.$disconnect();
});

describe('Authentication', () => {
    it('rejects a request with no token', async () => {
        const res = await request(app).get('/api/reports');
        expect(res.status).toBe(401);
    });

    it('rejects a request with an invalid token', async () => {
        const res = await request(app)
            .get('/api/reports')
            .set('Authorization', 'Bearer not-a-real-token');
        expect(res.status).toBe(401);
    });
});

describe('Role-based access — manager/admin-only routes', () => {
    it('blocks a TEAM_MEMBER from creating a project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${memberToken}`)
            .send({ name: 'Should Not Be Created' });
        expect(res.status).toBe(403);
    });

    it('allows a MANAGER to create a project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ name: 'Should Be Created By Manager' });
        expect(res.status).toBe(201);
        // clean up immediately
        await prisma.project.delete({ where: { id: res.body.id } });
    });

    it('allows an ADMIN to create a project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'RBAC Temp Project' });
        expect(res.status).toBe(201);
        // clean up immediately
        await prisma.project.delete({ where: { id: res.body.id } });
    });

    it('blocks a TEAM_MEMBER from viewing the team-wide report list', async () => {
        const res = await request(app)
            .get('/api/reports/team/all')
            .set('Authorization', `Bearer ${memberToken}`);
        expect(res.status).toBe(403);
    });

    it('allows a MANAGER to view the team-wide report list', async () => {
        const res = await request(app)
            .get('/api/reports/team/all')
            .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(200);
    });

    it('blocks a MANAGER (non-admin) from the admin user-management route', async () => {
        const res = await request(app)
            .get('/api/users/admin/all')
            .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(403);
    });

    it('allows an ADMIN to access the admin user-management route', async () => {
        const res = await request(app)
            .get('/api/users/admin/all')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });

    it('allows a MANAGER to load active team members for project management', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(String),
                role: 'TEAM_MEMBER',
                isActive: true,
            }),
        ]));
    });
});

describe('Ownership-based access — reports', () => {
    it('allows the owning TEAM_MEMBER to view their own report', async () => {
        const res = await request(app)
            .get(`/api/reports/${memberReportId}`)
            .set('Authorization', `Bearer ${memberToken}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(memberReportId);
    });

    it('blocks a DIFFERENT TEAM_MEMBER from viewing someone else\'s report', async () => {
        const res = await request(app)
            .get(`/api/reports/${memberReportId}`)
            .set('Authorization', `Bearer ${otherMemberToken}`);
        expect(res.status).toBe(403);
    });

    it('allows a MANAGER to view any team member\'s report', async () => {
        const res = await request(app)
            .get(`/api/reports/${memberReportId}`)
            .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(200);
    });

    it('blocks a MANAGER from creating a report (restricted to TEAM_MEMBER)', async () => {
        const res = await request(app)
            .post('/api/reports')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                projectId: testProjectId,
                weekStartDate: '2026-01-12',
                tasksNextWeek: '', notesLinks: '',
                tasks: [], highlights: [], hoursBreakdown: [],
            });
        expect(res.status).toBe(403);
    });
});

describe('Project member management', () => {
    let memberId, otherMemberId, managerId, adminId;

    beforeAll(async () => {
        const m = await prisma.user.findUnique({ where: { email: TEST_EMAILS.member } });
        memberId = m.id;
        const oM = await prisma.user.findUnique({ where: { email: TEST_EMAILS.otherMember } });
        otherMemberId = oM.id;
        const mM = await prisma.user.findUnique({ where: { email: TEST_EMAILS.manager } });
        managerId = mM.id;
        const aM = await prisma.user.findUnique({ where: { email: TEST_EMAILS.admin } });
        adminId = aM.id;
    });

    it('allows MANAGERs and ADMINs to see project members', async () => {
        const managerRes = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${managerToken}`);
        const adminRes = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(managerRes.status).toBe(200);
        expect(adminRes.status).toBe(200);
        expect(managerRes.body.find((project) => project.id === testProjectId)).toHaveProperty('projectMembers');
        expect(adminRes.body.find((project) => project.id === testProjectId)).toHaveProperty('projectMembers');
    });

    it('does not expose project members to a TEAM_MEMBER', async () => {
        const memberRes = await request(app)
            .post(`/api/projects/${testProjectId}/members`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ userId: memberId });

        expect(memberRes.status).toBe(201);

        const res = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${memberToken}`);

        expect(res.status).toBe(200);
        expect(res.body.find((project) => project.id === testProjectId)).not.toHaveProperty('projectMembers');
    });

    it('blocks a TEAM_MEMBER from adding or removing project members', async () => {
        const addRes = await request(app)
            .post(`/api/projects/${testProjectId}/members`)
            .set('Authorization', `Bearer ${memberToken}`)
            .send({ userId: otherMemberId });
        const removeRes = await request(app)
            .delete(`/api/projects/${testProjectId}/members/${otherMemberId}`)
            .set('Authorization', `Bearer ${memberToken}`);

        expect(addRes.status).toBe(403);
        expect(removeRes.status).toBe(403);
    });

    it('allows a MANAGER to add a TEAM_MEMBER to a project', async () => {
        const res = await request(app)
            .post(`/api/projects/${testProjectId}/members`)
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ userId: otherMemberId });
        expect(res.status).toBe(201);
    });

    it('allows a MANAGER to remove a TEAM_MEMBER from a project', async () => {
        const res = await request(app)
            .delete(`/api/projects/${testProjectId}/members/${otherMemberId}`)
            .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(204);
    });

    it('blocks a MANAGER from adding another MANAGER to a project', async () => {
        const res = await request(app)
            .post(`/api/projects/${testProjectId}/members`)
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ userId: managerId });
        expect(res.status).toBe(403);
    });

    it('allows an ADMIN to add a MANAGER to a project', async () => {
        const res = await request(app)
            .post(`/api/projects/${testProjectId}/members`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ userId: managerId });
        expect(res.status).toBe(201);
    });

    it('blocks a MANAGER from removing a MANAGER from a project', async () => {
        const res = await request(app)
            .delete(`/api/projects/${testProjectId}/members/${managerId}`)
            .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(403);
    });

    it('allows an ADMIN to remove a MANAGER from a project', async () => {
        const res = await request(app)
            .delete(`/api/projects/${testProjectId}/members/${managerId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(204);
    });
});