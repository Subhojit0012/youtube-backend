async function asyncHandler(fn: Promise<void>) {
  return Promise.resolve(fn).catch((err) => err);
}

export default asyncHandler;
