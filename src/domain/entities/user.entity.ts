export class User {
  id: string;
  email: string;
  password: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: User) {
    Object.assign(this, props);
  }
}
