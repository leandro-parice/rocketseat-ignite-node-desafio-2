import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  const userParamsSchema = z.object({
    id: z.string().uuid(),
  })

  /// INDEX
  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })

  /// CREATE
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
    })

    return reply.status(201).send()
  })

  /// SHOW
  app.get('/:id', async (request) => {
    const { id } = userParamsSchema.parse(request.params)

    const user = await knex('users')
      .where({
        id,
      })
      .first()

    return { user }
  })

  /// UPDATE
  app.put('/:id', async (request, reply) => {
    const { id } = userParamsSchema.parse(request.params)

    const updateUserBodySchema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    })

    const { name, email } = updateUserBodySchema.parse(request.body)

    await knex('users')
      .where({
        id,
      })
      .update({
        name,
        email,
      })

    return reply.status(204).send()
  })

  /// DELETE
  app.delete('/:id', async (request, reply) => {
    const { id } = userParamsSchema.parse(request.params)

    await knex('meals')
      .where({
        user_id: id,
      })
      .del()

    await knex('users')
      .where({
        id,
      })
      .del()

    return reply.status(204).send()
  })
}
