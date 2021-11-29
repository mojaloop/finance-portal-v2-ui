import { Selector } from 'testcafe';
import { config } from '../config';

fixture.skip`DFSPFinancialPositionsFeature`.page`${config.financePortalEndpoint}`;

const { admin, user } = config.credentials;

const loginNavigateToChangeNDC = ({ username, password }: { username: string, password: string }) => async (t: TestController) =>
  await t
    .typeText('#login__input-username', username)
    .typeText('#login__input-password', password)
    .click('#login__btn-submit')
    .click(Selector('#root div').withText('DFSP Financial Positions').nth(6))
    .click('#btn__update_testfsp2')
    .click(Selector('#select__action div').withText('Select Action...'))
    .click(Selector('#select__action div').withText('Change Net Debit Cap').nth(6));

test
  .meta({
    ID: 'MMD-T43',
    STORY: 'MMD-435',
  })
  .before(loginNavigateToChangeNDC(admin))('Update NDC - Authorized user.', async (t) => {
  await t
    .typeText('#input__amount', '10000')
    .click('#btn__submit_update_participant')
    .click('#btn__confirm_upd_participant')
    .wait(10000)
    .expect(Selector('.el-datalist__row').nth(6).find('div').withText('10,000').textContent)
    .ok({
      timeout: 30000,
    });
});

test
  .meta({
    ID: 'MMD-T44',
    STORY: 'MMD-435',
  })
  .before(loginNavigateToChangeNDC(user))('Update NDC - Unauthorized user.', async (t) => {
  await t
    .typeText('#input__amount', '10000')
    .click('#btn__submit_update_participant')
    .click('#btn__confirm_upd_participant')
    .expect(Selector('#msg_error__positions').textContent)
    .contains('Unable to update Net Debit Cap - user not authorized');
});

test
  .meta({
    ID: 'MMD-T??',
    STORY: 'MMD-435',
  })
  .before(loginNavigateToChangeNDC(admin))('NDC - Higher than the available balance.', async (t) => {
  await t
    .typeText('#input__amount', '999999999999999999')
    .click(Selector('#btn__submit_update_participant span').withText('Submit'))
    .click(Selector('#btn__confirm_upd_participant span').withText('Confirm'))
    .expect(Selector('#msg_error__positions').textContent)
    .contains('Unable to update Net Debit Cap');
});

test
  .meta({
    ID: 'MMD-T??',
    STORY: 'MMD-435',
  })
  .before(loginNavigateToChangeNDC(admin))('NDC - Negative number.', async (t) => {
  await t.typeText('#input__amount', '-15000').expect(Selector('#input__amount').value).contains('15000');
});

test
  .meta({
    ID: 'MMD-T??',
    STORY: 'MMD-435',
  })
  .before(loginNavigateToChangeNDC(admin))('NDC - Positive number.', async (t) => {
  await t
    .typeText('#input__amount', '15000')
    .click('#btn__submit_update_participant')
    .click('#btn__confirm_upd_participant')
    .wait(5000)
    // TODO: would be much better to use a React selector here
    .expect(Selector('.financial-positions .el-datalist__rows .el-datalist__row').withText('testfsp2').nth(0).child().nth(3).textContent)
    .contains('15,000', {
      timeout: 30000,
    });
});

test
  .meta({
    ID: 'MMD-T??',
    STORY: 'MMD-435',
  })
  .before(loginNavigateToChangeNDC(admin))('NDC - Higher Balance.', async (t) => {
  await t
    .typeText('#input__amount', '999999999999999999')
    .click('#btn__submit_update_participant')
    .click('#btn__confirm_upd_participant')
    .expect(Selector('#msg_error__positions').textContent)
    .contains('Unable to update Net Debit Cap');
});

test
  .meta({
    ID: 'MMD-T??',
    STORY: 'MMD-435',
  })
  .before(loginNavigateToChangeNDC(admin))('NDC - 0.', async (t) => {
  await t.typeText('#input__amount', '0').expect(Selector('#input__amount').value).contains('');
});
