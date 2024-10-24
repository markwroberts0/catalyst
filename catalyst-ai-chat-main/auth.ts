import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import axios from 'axios'

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null
        }

        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data

          try {
            // Make a request to the /token endpoint
            const response = await axios.post(
              'https://onramp-api-dev.thankfulbeach-c26bca6d.eastus.azurecontainerapps.io/token',
              JSON.stringify({
                grant_type: 'password',
                username: email,
                password: password
              }),
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              }
            )

            if (response.status === 200) {
              // Token received successfully
              const { access_token } = response.data
              return { id: email, email, access_token }
            } else {
              return null
            }
          } catch (error) {
            console.error('Error authenticating with API', error)
            return null
          }
        }

        return null
      }
    })
  ]
})