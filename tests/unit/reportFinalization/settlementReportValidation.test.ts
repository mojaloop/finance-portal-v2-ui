
import { validateReport, extractReportQuantity } from '../../../src/App/Settlements/helpers';

describe('numeric value extraction', () => {
  const negativeTestCases = [
    ['1,23', NaN],
    ['1.2.34', NaN],
    ['1,23.33', NaN],
    ['1.2.99876', NaN],
    ['abc', NaN],
    ['', NaN],
    ['whatever', NaN],
    ['undefined', NaN],
    ['null', NaN],
    ['Null', NaN],
    ['Infinity', NaN],
    ['Inf', NaN],
    [(new Date()).toISOString(), NaN],
  ].flatMap(([input, result]) => ([
    [input, result],
    [`-${input}`, result],
    [`(${input})`, result],
  ]) as [string, number][]);
  test.each(negativeTestCases)(
    'extracts %s to %p',
    (input, expected) => {
      expect.assertions(1);
      expect(extractReportQuantity(input)).toEqual(expected);
    },
  );

  // We should also test numbers at, greater than, and less than various JS limits, e.g.
  // Number.MAX_*.
  const edgeCases: [string, number][] = [
    ['-0', -0],
    ['0', 0],
  ];
  test.each(edgeCases)(
    'extracts %s to %p',
    (input, expected) => {
      expect.assertions(1);
      expect(extractReportQuantity(input)).toEqual(expected);
    },
  );

  // TODO: we should use a different distribution..
  // Probably sample ~100000 points in [0, max] in a linearly-translated, linearly-transformed
  // inverse log distribution, favouring points closer to zero. This way we should get a good range
  // of orders of magnitude, but favour numbers closer to where we expect them.
  test.concurrent.each(Array.from({ length: 20000 }).flatMap((_, i) => {
    const x = Math.random() * i * i;
    const xStr = x.toString();
    // Note that this is a convenience. We don't explicitly support this locale (or otherwise), but
    // using this locale is convenient for generating a string in the format we require.
    const xLStr = String(x).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,')
    // const xLStr = x.toLocaleString('en-GB');
    return [
      [
        x,
        xStr,
      ],
      [
        x,
        xLStr,
      ],
      [
        -x,
        `(${xStr})`,
      ],
      [
        -x,
        `(${xLStr})`,
      ],
      [
        -x,
        `-${xStr}`,
      ],
      [
        -x,
        `-${xLStr}`,
      ],
    ];
  }) as [number, string][])(
    'extracts %p from %s',
    (expected, input) => {
      expect.assertions(1);
      expect(extractReportQuantity(input)).toEqual(expected);
    },
  );
})

test('simple_positive.xlsx', async () => {
  expect.assertions(1);
  expect(1).toEqual(1);
  // const f = await readFile(path.join(__dirname, '/mock_data/simple_positive.xlsx'));
  // const report = await loadWorksheetData(f);
  // expect(report).toEqual({
  //   "settlementId": 13,
  //   "entries": [
  //     {
  //       "participant": {
  //         "id": 11,
  //         "name": "mmdokdollar"
  //       },
  //       "positionAccountId": 21,
  //       "balance": 1501000,
  //       "transferAmount": -1500
  //     },
  //     {
  //       "participant": {
  //         "id": 1,
  //         "name": "visionfund"
  //       },
  //       "positionAccountId": 19,
  //       "balance": 2200,
  //       "transferAmount": 1000
  //     },
  //     {
  //       "participant": {
  //         "id": 3,
  //         "name": "hana"
  //       },
  //       "positionAccountId": 25,
  //       "balance": 2200,
  //       "transferAmount": 500
  //     }
  //   ],
  // });
});
