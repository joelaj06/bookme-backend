const paginateResults = async({model, query, page, limit}) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    const results = {};

    const totalCount = await model.countDocuments(query);
  
    if (endIndex < (await model.countDocuments(query).exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
  
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
  
    const paginatedResults = await model.find(query)
      .limit(limit)
      .skip(startIndex)
      .exec();
  
    return {
      limit,
      startIndex,
      totalCount,
      results: paginatedResults,
      pagination: results,
    };
  };
  
  module.exports = paginateResults;
  