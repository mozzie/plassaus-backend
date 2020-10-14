class JwtPayload {
  sub: number;

  username: string;

  iat?: number;

  exp?: number;
}

export default JwtPayload;
