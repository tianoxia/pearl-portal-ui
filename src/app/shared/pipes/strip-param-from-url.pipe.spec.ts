import { StripParamFromUrlPipe } from './strip-param-from-url.pipe';

describe('StripParamFromUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new StripParamFromUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
