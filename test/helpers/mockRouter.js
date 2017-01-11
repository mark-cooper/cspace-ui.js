export default function mockRouter(properties) {
  const router = {
    push: () => null,
    replace: () => null,
    go: () => null,
    goBack: () => null,
    goForward: () => null,
    setRouteLeaveHook: () => null,
    isActive: () => null,
  };

  Object.assign(router, properties);

  return router;
}