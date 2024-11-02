import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { MemberType, MemberTypeIdEnum } from '../types/memberType.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { UserType } from '../types/user.js';
import { UUIDType } from '../types/uuid.js';

export type UserIncludetFields = {
  profile?: boolean;
  posts?: boolean;
  userSubscribedTo?: boolean;
  subscribedToUser?: boolean;
};

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
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (parent, args, context, info) => {
        const parsedInfo = parseResolveInfo(info);
        if (!parsedInfo?.fieldsByTypeName.User) {
          return context.prisma.user.findMany();
        }

        const fields = parsedInfo.fieldsByTypeName.User;

        const include: UserIncludetFields = {};
        if (fields['profile']) {
          include.profile = true;
        }
        if (fields['posts']) {
          include.posts = true;
        }
        if (fields['userSubscribedTo']) {
          include.userSubscribedTo = true;
        }
        if (fields['subscribedToUser']) {
          include.subscribedToUser = true;
        }

        const users = await context.prisma.user.findMany({ include });
        users.forEach((user) => {
          context.loaders.userLoader.prime(user.id, user);
        });
        return users;
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, { id }, context) => {
        return context.prisma.user.findUnique({ where: { id } });
      },
    },
  },
});
