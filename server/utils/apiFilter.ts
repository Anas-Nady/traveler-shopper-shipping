import { Request } from "express";

class ApiFilter {
  private query: any;
  private queryString: Request["query"];

  constructor(query: any, queryString: Request["query"]) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  search(searchValue: string, fields: string[]) {
    if (this.queryString.search) {
      const regex = new RegExp(searchValue, "i");

      const query: { $or: any[] } = { $or: [] };
      fields.map((field) => {
        query.$or.push({ [field]: regex });
      });

      this.query = this.query.find(query);
    }
    return this;
  }

  select() {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  pagination() {
    const page = parseInt(this.queryString.page as string, 10) || 1;
    const limit = parseInt(this.queryString.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  build() {
    return this.query;
  }
}

export default ApiFilter;
