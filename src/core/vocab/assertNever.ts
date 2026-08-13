export function assertNever(value: never): never {
  throw new Error(`unreachable verdict branch: ${JSON.stringify(value)}`);
}
