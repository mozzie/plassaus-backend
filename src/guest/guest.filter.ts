class GuestFilter {
  name: string;

  page: number;

  pageSize: number;

  sortBy: string;

  sortOrder: 'ASC' | 'DESC';

  static sanitized(filter: GuestFilter): GuestFilter {
    const newFilter = filter || new GuestFilter();
    newFilter.page = Number.isNaN(Number(filter.page)) ? 0 : Math.max(filter.page, 0);
    newFilter.pageSize = Number.isNaN(Number(filter.pageSize)) ? 20
      : Math.min(Math.max(filter.pageSize, 0), 20);
    newFilter.sortBy = ['id', 'name'].includes(filter.sortBy) ? filter.sortBy : 'id';
    newFilter.sortOrder = ['ASC', 'DESC'].includes(filter.sortOrder) ? filter.sortOrder : 'ASC';
    return newFilter;
  }
}

export default GuestFilter;
