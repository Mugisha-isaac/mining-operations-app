import { join, resolve } from 'path';

export const OPERATIONS_PACKAGE = 'minetech.operations';

/**
 * `yarn workspace <name> <script>` executes with cwd set to that
 * workspace's own folder (e.g. apps/core-service), two levels below the
 * repo root where /proto lives. PROTO_PATH can override this for any other
 * launch method (e.g. running compiled dist/ output, or CI).
 */
export const OPERATIONS_PROTO_PATH =
  process.env.PROTO_PATH ?? resolve(process.cwd(), '../../proto/operations.proto');

export const resolveProtoPath = (fromDir: string): string => join(fromDir, 'operations.proto');
