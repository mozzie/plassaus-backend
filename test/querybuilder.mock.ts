import { SelectQueryBuilder } from 'typeorm';

class QueryBuilderMock<Entity> extends SelectQueryBuilder<Entity > {
  constructor() {
    super(undefined, undefined);
  }

  where = jest.fn().mockReturnValue(this);

  andWhere = this.where;

  skip = jest.fn().mockReturnValue(this);

  take = jest.fn().mockReturnValue(this);

  orderBy = jest.fn().mockReturnValue(this);

  getMany = jest.fn().mockResolvedValue([]);
}

export default QueryBuilderMock;
