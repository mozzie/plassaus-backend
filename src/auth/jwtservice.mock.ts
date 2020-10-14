import JwtPayload from './jwtpayload.entity';

const mockedJwtService = {
  sign(payload : JwtPayload) : string {
    return payload ? 'mocked_access_token' : 'no_payload';
  },
};

export default mockedJwtService;
