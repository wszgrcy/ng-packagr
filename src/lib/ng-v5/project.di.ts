import { InjectionToken, ValueProvider } from 'injection-js';
/** 项目配置token */
export const PROJECT_TOKEN = new InjectionToken<string>(`ng.v5.project`);

export const provideProject = (project: string): ValueProvider => ({
  provide: PROJECT_TOKEN,
  useValue: project,
});
