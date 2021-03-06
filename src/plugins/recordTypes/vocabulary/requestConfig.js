export default (requestType) => {
  if (requestType === 'read') {
    return {
      params: {
        showItems: true,
      },
    };
  }

  if (requestType === 'save') {
    return {
      params: {
        omittedItemAction: 'softdelete',
        wf_deleted: false,
      },
    };
  }

  return undefined;
};
