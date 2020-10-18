class EventFilter {
  name: string;

  page: number;

  pageSize: number;

  sortBy: string;

  sortOrder: 'ASC' | 'DESC';

  static sanitized(filter: EventFilter): EventFilter {
    const newFilter = filter || new EventFilter();
    newFilter.page = Number.isNaN(Number(filter.page)) ? 0 : Math.max(filter.page, 0);
    newFilter.pageSize = Number.isNaN(Number(filter.pageSize)) ? 20
      : Math.min(Math.max(filter.pageSize, 1), 20);
    newFilter.sortBy = ['id', 'name'].includes(filter.sortBy) ? filter.sortBy : 'id';
    newFilter.sortOrder = ['ASC', 'DESC'].includes(filter.sortOrder) ? filter.sortOrder : 'ASC';
    return newFilter;
  }
}

export default EventFilter;
