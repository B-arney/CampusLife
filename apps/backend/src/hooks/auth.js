export async function adminOnly(request, reply) {
    if (!request.user.isAdmin) {
        return reply.code(403).send({ error: 'Admin access required.' })
    }
}

