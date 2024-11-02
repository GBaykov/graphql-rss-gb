import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { MemberType, MemberTypeIdEnum } from '../types/memberType.js';

export const Query = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (parent, args, context) => {
        try {
          const memberTypes = await context.prisma.memberType.findMany();
          return memberTypes;
        } catch (error) {
          console.error('Error in memberTypes resolver:', error);
          throw error;
        }
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: async (parent, { id }, context) => {
        return context.prisma.memberType.findUnique({ where: { id } });
      },
    },
  },
});
