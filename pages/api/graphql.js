import { ApolloServer } from "apollo-server-micro";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import supabaseClient from "@/lib/supabase";


const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true,
    cache: "bounded",
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req }) => ({
        supabaseClient,
        ip: req.headers["x-real-ip"] ?? req.connection.remoteAddress,
    }),
});

const startServer = apolloServer.start();

export default async function handler(req, res) {
  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
