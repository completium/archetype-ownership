import { expect_to_fail, get_account, set_mockup, set_mockup_now, set_quiet } from '@completium/experiment-ts'
import { Option } from '@completium/archetype-ts-types'

import assert from 'assert';

import { ownership } from './binding/ownership'

/* Accounts ---------------------------------------------------------------- */

const alice = get_account('alice');
const bob = get_account('bob')

/* Endpoint ---------------------------------------------------------------- */

set_mockup()

/* Verbose mode ------------------------------------------------------------ */

set_quiet(true);

/* Now --------------------------------------------------------------------- */

set_mockup_now(new Date(Date.now()))

/* Scenario ---------------------------------------------------------------- */

describe('[Template] ownership', () => {
  it('Deploy ownership', async () => {
    await ownership.deploy(alice.get_address(), { as: alice })
  });

  it("Call declare_ownership with wrong owner should fail", async () => {
    await expect_to_fail(async () => {
      await ownership.declare_ownership(bob.get_address(), { as: bob })
    }, ownership.errors.INVALID_CALLER)
  })

  it("Call declare_ownership with right owner should succeed", async () => {
    const owner_before = await ownership.get_owner()
    assert(owner_before.equals(alice.get_address()), "Invalid value");

    const owner_candidate_before = await ownership.get_owner_candidate();
    assert(owner_candidate_before.equals(Option.None()), "Invalid value");

    await ownership.declare_ownership(bob.get_address(), { as: alice })

    const owner_after = await ownership.get_owner()
    assert(owner_after.equals(alice.get_address()), "Invalid value");

    const owner_candidate_after = await ownership.get_owner_candidate();
    assert(owner_candidate_after.equals(Option.Some(bob.get_address())), "Invalid value");
  })

  it("Call claim_ownership with wrong candidate owner should fail", async () => {
    await expect_to_fail(async () => {
      await ownership.claim_ownership({ as: alice })
    }, ownership.errors.INVALID_CALLER)
  })

  it("Call claim_ownership with right candidate owner should succeed", async () => {
    const owner_before = await ownership.get_owner()
    assert(owner_before.equals(alice.get_address()), "Invalid value");

    const owner_candidate_before = await ownership.get_owner_candidate();
    assert(owner_candidate_before.equals(Option.Some(bob.get_address())), "Invalid value");

    await ownership.claim_ownership({ as: bob })

    const owner_after = await ownership.get_owner()
    assert(owner_after.equals(bob.get_address()), "Invalid value");

    const owner_candidate_after = await ownership.get_owner_candidate();
    assert(owner_candidate_after.equals(Option.None()), "Invalid value");
  })
})
