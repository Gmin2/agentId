import { GraphQLClient } from 'graphql-request'
import { GRAPHQL_URL } from './chain.ts'

export const graphqlClient = new GraphQLClient(GRAPHQL_URL)
