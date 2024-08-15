import os

import numpy as np
import py_text_tools as ptt
import pyds
from sklearn.linear_model import LogisticRegression


def float_string(x):
    x = float(x)
    return "{:.12f}".format(x)


dir = (os.path.sep).join(__file__.split(os.path.sep)[:-1])


x = np.random.normal(size=[25, 3])
y = np.round(np.random.random(size=x.shape[0]))

logreg = LogisticRegression()
logreg.fit(x, y)
y_true = logreg.predict_proba(x)

if y_true.shape[1] > 1:
    y_true = [v[-1] for v in y_true]

y_true = pyds.flatten(y_true)

unit_test_template = ptt.unindent("""
	>> x = {{ x }}
	>> coefficients = {{ coefficients }}
	>> intercept = {{ intercept }}

	*program: @jrc03c/logistic-regression-predict

	>> y_pred = y         
	>> y_true = {{ y_true }}

	*program: @jrc03c/r-squared

	*if: r_squared >= 0.9999
		>> success_title = "@jrc03c/logistic-regression-predict/tests"
		>> success_message = "Passed!"
		*program: @jrc03c/show-success

	*if: r_squared < 0.9999
		>> error_title = "@jrc03c/logistic-regression-predict/tests"
		>> error_message = "Expected an R^2 score greater than or equal to 0.9999, but received {r_squared}!"
		*program: @jrc03c/show-error

		>> x = y_true
		*program: @jrc03c/flatten
		>> x = x_flat
		*program: @jrc03c/shape

		y_true.shape: {shape}

		>> x = y_pred
		*program: @jrc03c/flatten
		>> x = x_flat
		*program: @jrc03c/shape

		y_pred.shape: {shape}

		y_true: {y_true}

		y_pred: {y_pred}
""")

x_string = "[{}]".format(
    (", ").join(
        ["[{}]".format((", ").join([float_string(v) for v in row])) for row in x]
    )
)

unit_test_1 = unit_test_template.replace("{{ x }}", x_string)

coef_string = "[{}]".format(
    (", ").join(
        [
            "[{}]".format((", ").join([float_string(v) for v in row]))
            for row in logreg.coef_
        ]
    )
)

unit_test_1 = unit_test_1.replace("{{ coefficients }}", coef_string)

unit_test_1 = unit_test_1.replace(
    "{{ intercept }}", float_string(pyds.flatten(logreg.intercept_).tolist()[0])
)

y_true_string = "[{}]".format((", ").join([float_string(v) for v in y_true]))

unit_test_1 = unit_test_1.replace("{{ y_true }}", y_true_string)

template = ("\n\n").join(['>> error_is_fatal = "no"', unit_test_1, "*button: Okay"])

lines = template.split("\n")
out = []

for line in lines:
    line_stripped = line.strip()

    if len(line_stripped) == 0:
        out.append("")

    else:
        out.append(line)

out = ("\n").join(lines)

with open(os.path.join(dir, "tests.gt"), "w") as file:
    file.write(out)
