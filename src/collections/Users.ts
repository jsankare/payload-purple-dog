import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
      {
          name: 'firstName',
          type: 'text',
          required: true,
      },
      {
          name: 'lastName',
          type: 'text',
          required: true,
      },
      {
          name: 'gender',
          type: 'radio',
          required: true,
          options: [
              {
                  label: 'Male',
                  value: 'male'
              },
              {
                  label: 'Female',
                  value: 'female'
              },
              {
                  label: 'Other',
                  value: 'other'
              }
          ]
      }

  ],
}
