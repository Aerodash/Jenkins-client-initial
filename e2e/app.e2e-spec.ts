import { JenkinsClientPage } from './app.po';

describe('jenkins-client App', () => {
  let page: JenkinsClientPage;

  beforeEach(() => {
    page = new JenkinsClientPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
