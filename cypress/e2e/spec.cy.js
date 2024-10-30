describe('Index page', () => {
  it('should be valid', () => {
    cy.visit('http://localhost:8000');

    cy.htmlvalidate({
      rules: {
        'require-sri': 'off',
        'no-deprecated-attr': 'off',
        'element-required-attributes': 'off',
        'script-type': 'off'
      }
    });
  });
});
