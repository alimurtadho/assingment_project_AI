/**
 * @deprecated This file is deprecated. Use modular API from @/api instead.
 * This file is maintained for backward compatibility only.
 * 
 * Migration guide:
 * - Replace `import { authAPI } from './api'` with `import { authService } from './api'`
 * - Replace `authAPI.login()` with `authService.login()`
 * - Replace `authAPI.getCurrentUser()` with `userService.getCurrentUser()`
 */

import { authService, userService, httpClient } from './api/index';

console.warn('[DEPRECATED] Using legacy api.ts file. Consider migrating to modular API.');
console.time('Legacy-API-Import');

// Re-export for backward compatibility
export { authService as authAPI } from './api/index';
export default httpClient;

console.timeEnd('Legacy-API-Import');
