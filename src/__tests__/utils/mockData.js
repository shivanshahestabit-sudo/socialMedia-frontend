export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  picturePath: 'profile.jpg',
  friends: [],
  location: 'New York, NY',
  occupation: 'Software Engineer'
};

export const mockPost = {
  _id: '507f1f77bcf86cd799439012',
  userId: '507f1f77bcf86cd799439011',
  firstName: 'John',
  lastName: 'Doe',
  description: 'This is a test post',
  picturePath: 'post.jpg',
  userPicturePath: 'profile.jpg',
  likes: {},
  comments: [],
  createdAt: '2023-01-01T00:00:00.000Z'
};

export const mockAuthState = {
  user: mockUser,
  token: 'mock-token',
  posts: [mockPost]
};
