import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/db.js';
import { register } from '../src/auth.js';
import { createCompany } from '../src/companies.js';
import { uid } from '../src/utils.js';

function setup() {
  const db = openDatabase(':memory:');

  const user = register(db, {
    name: 'GST Test User',
    email: `gst-${uid()}@example.com`,
    password: 'a-very-strong-test-password'
  });

  return { db, user };
}

test('unregistered business can be created without GSTIN', () => {
  const { db, user } = setup();

  try {
    const company = createCompany(db, user.id, {
      name: 'Small Retail Shop',
      state_code: '27',
      gst_registration_type: 'UNREGISTERED',
      gstin: ''
    });

    assert.equal(company.name, 'Small Retail Shop');
    assert.equal(company.gstin, null);
    assert.equal(
      company.gst_registration_type,
      'UNREGISTERED'
    );
  } finally {
    db.close();
  }
});

test('regular GST registration requires a valid-format GSTIN', () => {
  const { db, user } = setup();

  try {
    assert.throws(() =>
      createCompany(db, user.id, {
        name: 'Regular GST Business',
        state_code: '27',
        gst_registration_type: 'REGULAR',
        gstin: ''
      })
    );

    const company = createCompany(db, user.id, {
      name: 'Registered Business',
      state_code: '27',
      gst_registration_type: 'REGULAR',
      gstin: '27ABCDE1234F1Z5'
    });

    assert.equal(company.gst_registration_type, 'REGULAR');
    assert.equal(company.gstin, '27ABCDE1234F1Z5');
  } finally {
    db.close();
  }
});

test('composition registration requires a valid-format GSTIN', () => {
  const { db, user } = setup();

  try {
    assert.throws(() =>
      createCompany(db, user.id, {
        name: 'Composition Business',
        state_code: '27',
        gst_registration_type: 'COMPOSITION',
        gstin: ''
      })
    );

    const company = createCompany(db, user.id, {
      name: 'Composition Business',
      state_code: '27',
      gst_registration_type: 'COMPOSITION',
      gstin: '27ABCDE1234F1Z5'
    });

    assert.equal(
      company.gst_registration_type,
      'COMPOSITION'
    );
  } finally {
    db.close();
  }
});
