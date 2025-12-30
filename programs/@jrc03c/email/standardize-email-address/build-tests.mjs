import { removeExtraWhitespace } from "#helpers/remove-extra-whitespace.mjs"
import { removeLeadingAndTrailingSpaces } from "#helpers/remove-leading-and-trailing-spaces.mjs"
import { unindent } from "@jrc03c/js-text-tools"
import fs from "node:fs"
import path from "node:path"

function rebuild() {
  const dir = import.meta.dirname
  const file = path.join(dir, "tests-template.gt")
  const template = fs.readFileSync(file, "utf8")

  const options = {
    should_convert_domain_to_punycode: 0,
    should_remove_diacritical_marks_in_username: 1,
    should_remove_periods_in_username: 0,
    should_remove_tags_in_username: 0,
  }

  const passingTests = [
    ["someone", options, "someone"],
    ["someone@a@b@c@example.com", options, "someone@a@b@c@example.com"],
    ["someone@example.com", options, "someone@example.com"],
    ["SoMeOnE@eXaMpLe.CoM", options, "someone@example.com"],
    ["s o m e o n e @ e x a m p l e . c o m", options, "someone@example.com"],
    ["sömeoné@exåmple.com", options, "someone@exåmple.com"],
    [
      "sömeoné@exåmple.com",
      { ...options, should_remove_diacritical_marks_in_username: 0 },
      "sömeoné@exåmple.com",
    ],
    [
      "sömeoné@exåmple.com",
      { ...options, should_convert_domain_to_punycode: 1 },
      "someone@xn--exmple-jua.com",
    ],
    ["s.o.m.e.o.n.e@example.com", options, "s.o.m.e.o.n.e@example.com"],
    [
      "s.o.m.e.o.n.e@example.com",
      { ...options, should_remove_periods_in_username: 1 },
      "someone@example.com",
    ],
    ["someone+test@example.com", options, "someone+test@example.com"],
    [
      "someone+test@example.com",
      { ...options, should_remove_tags_in_username: 1 },
      "someone@example.com",
    ],
  ]

  const out = removeExtraWhitespace(
    template.replace(
      `{{ passingTests }}`,
      passingTests
        .map(trio => {
          const [x, options, y] = trio

          return unindent(
            removeLeadingAndTrailingSpaces(`
						${"-".repeat(80)}
						
						>> email_address = "${x}"
						>> should_convert_domain_to_punycode = ${options.should_convert_domain_to_punycode}
						>> should_remove_diacritical_marks_in_username = ${options.should_remove_diacritical_marks_in_username}
						>> should_remove_periods_in_username = ${options.should_remove_periods_in_username}
						>> should_remove_tags_in_username = ${options.should_remove_tags_in_username}
						
						*program: @jrc03c/email/standardize-email-address

						*if: email_address_standardized = "${y}"
							>> success_message = "'{email_address_standardized}' = '${y}'"
							*program: @jrc03c/show-success

						*if: not (email_address_standardized = "${y}")
							>> error_message = "'{email_address_standardized}' != '${y}'"
							*program: @jrc03c/show-error
						
						*wait: 1.seconds
					`),
          )
        })
        .join("\n\n"),
    ),
  )

  fs.writeFileSync(path.join(dir, "tests.gt"), out, "utf8")
}

rebuild()
