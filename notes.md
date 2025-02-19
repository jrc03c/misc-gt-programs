# Program checklist

- Clean up all relevant variables at the end of the main program by assigning empty string values to them.
  - It might be wise to create a label immediately before the clean-up section so that the program can `*goto` the label if it needs to return early for some reason.
- Write unit tests and/or provide a manual testing program.
- Ensure that both the main program and any test programs have front matter.
  - Document all input and output variables.
  - Document any relevant settings (like service settings).
  - Update all URLs.
  - Update the names in the front matter and/or on guidedtrack.com to be consistent with one another.
  - Link to this repository.
- Ensure that all `*program` calls use up-to-date program names.
- Run build scripts to generate programs according to their most recent templates.
- Update the source code on guidedtrack.com to match the code in this repository.
- Mark the main program and any test programs as "public" in their access settings.
- Remove any sensitive information like API keys from the source code and the service settings in the main program and in any test programs.
- Add the program to the README index.

## Program name and/or API changes

Change a program's name or API requires extra care since it's possible to break other developers' programs if those programs call yours using `*program`.

If you want to change the name of a program, _do not_ rename the program on guidedtrack.com. Instead, make a new program on guidedtrack.com with the new name, and paste in the source code. Then, in the old program's description, indicate that it has been deprecated and superseded by the program with the new name. Do not make any other changes to the old program since there's no way to know whether or not other developers' programs are relying on your programs!

Similarly, if you want to change the API of a program, _do not_ modify the existing program. Instead, make a new program and fill it with the updated source code. Once again, this behavior is necessary because there's no way to know whether or not other developers' programs rely on yours. If you still want to use the same name as the original program, then perhaps apply a version number to the name. For example, if the original program is called "@jrc03c/whatever", and you update the API by creating a new program, then maybe name the new program something like "@jrc03c/whatever (v0.1)" or whatever.
