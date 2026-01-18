import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Photo: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      s3Key: a.string().required(),
      uploadedAt: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.owner().to(['read', 'delete']),
      allow.authenticated().to(['read']),
    ]),
  
  Comment: a
    .model({
      photoId: a.id().required(),
      userId: a.string().required(),
      username: a.string().required(),
      content: a.string().required(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.owner().to(['read', 'delete']),
      allow.authenticated().to(['read', 'create']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
