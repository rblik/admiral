import { AdmiralPage } from './app.po';

describe('admiral App', function() {
  let page: AdmiralPage;

  beforeEach(() => {
    page = new AdmiralPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
