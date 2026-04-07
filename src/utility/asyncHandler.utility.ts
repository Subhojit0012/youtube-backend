async function asyncHandler(fn: (...args: any[]) => Promise<void>) {
  return Promise.resolve(fn).catch((err) => {throw err});
}

export default asyncHandler;
