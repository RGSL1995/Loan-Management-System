#!/usr/bin/env node
/**
 * Puppeteer script to click MCA login button
 * SMART APPROACH: Find button below password field
 */

const puppeteer = require('puppeteer');

async function clickLoginButton() {
  console.log('\n🤖 PUPPETEER LOGIN BUTTON CLICK (Smart Detection)');
  console.log('='.repeat(60));
  console.log('Task: Find and click button BELOW password field\n');

  let browser;
  try {
    // Connect to existing Chrome instance
    console.log('🔌 Connecting to running Chrome instance...');
    browser = await puppeteer.connect({
      browserWSEndpoint: 'http://127.0.0.1:9222',
    });
    console.log('✅ Connected to Chrome\n');

    // Get the latest page
    const pages = await browser.pages();
    const page = pages[pages.length - 1];
    console.log(`📄 Using page: ${await page.title()}\n`);

    // ============================================================
    // SMART APPROACH: Find password field, then find button below it
    // ============================================================
    console.log('🧠 SMART DETECTION ALGORITHM');
    console.log('-'.repeat(60) + '\n');

    const result = await page.evaluate(() => {
      // STEP 1: Find password field
      console.log('STEP 1: Finding password input field...');
      const passwordField = document.querySelector('input[type="password"]');

      if (!passwordField) {
        console.log('❌ Password field not found!');
        return { error: 'password_field_not_found' };
      }

      const passwordRect = passwordField.getBoundingClientRect();
      console.log(`✅ Found password field at y=${Math.round(passwordRect.top)}\n`);

      // STEP 2: Find ALL buttons on the page
      console.log('STEP 2: Finding all buttons on page...');
      const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      console.log(`✅ Found ${allButtons.length} total buttons\n`);

      // DEBUG: Show all buttons with their positions
      console.log('DEBUG - ALL BUTTONS DETAILS:');
      allButtons.forEach((btn, idx) => {
        const rect = btn.getBoundingClientRect();
        console.log(`  [${idx}] "${btn.textContent.trim().substring(0, 30)}" at y=${Math.round(rect.top)}`);
      });
      console.log('');

      // STEP 3: Filter for buttons BELOW password field
      console.log('STEP 3: Filtering buttons - keep only those BELOW password field...');
      console.log(`   Password field bottom is at y=${Math.round(passwordRect.bottom)}\n`);

      const allButtonsInfo = allButtons.map((btn) => {
        const rect = btn.getBoundingClientRect();
        return {
          element: btn,
          y: Math.round(rect.top),
          x: Math.round(rect.left),
          text: btn.textContent.trim().substring(0, 40),
          tag: btn.tagName,
          type: btn.type || 'none',
          visible: rect.width > 0 && rect.height > 0,
        };
      });

      // Show which buttons pass/fail the filter
      console.log('DEBUG - BUTTON FILTER RESULTS:');
      allButtonsInfo.forEach((btn) => {
        const isBelowPassword = btn.y > Math.round(passwordRect.bottom) + 10;
        const isVisible = btn.visible;
        const status = (isBelowPassword && isVisible) ? '✅ PASS' : '❌ FAIL';
        const reason = !isBelowPassword ? `(y=${btn.y} not below ${Math.round(passwordRect.bottom)})` :
                       !isVisible ? '(not visible)' : '';
        console.log(`  ${status} "${btn.text}" ${reason}`);
      });
      console.log('');

      const buttonsBelowPassword = allButtonsInfo
        .filter((btn) => {
          const isBelowPassword = btn.y > Math.round(passwordRect.bottom) + 10;
          const isVisible = btn.visible;
          return isBelowPassword && isVisible;
        })
        .sort((a, b) => a.y - b.y); // Sort by Y position (closest first)

      console.log(`✅ Found ${buttonsBelowPassword.length} buttons BELOW password field\n`);

      if (buttonsBelowPassword.length === 0) {
        console.log('❌ No buttons found below password field!');
        return { error: 'no_buttons_below_password' };
      }

      // STEP 4: Select the FIRST button below password (closest one = most likely submit button)
      console.log('STEP 4: Selecting first (closest) button below password...\n');
      const targetButton = buttonsBelowPassword[0];

      console.log(`🎯 TARGET BUTTON FOUND:`);
      console.log(`   Text: "${targetButton.text}"`);
      console.log(`   Position: (${targetButton.x}, ${targetButton.y})`);
      console.log(`   Tag: <${targetButton.tag}> type="${targetButton.type}"\n`);

      // STEP 5: Click the button
      console.log('STEP 5: Clicking the button...\n');
      targetButton.element.click();

      return {
        success: true,
        text: targetButton.text,
        y: targetButton.y,
        x: targetButton.x,
      };
    });

    // Handle result
    if (result.error) {
      console.log(`❌ ERROR: ${result.error}`);
      console.log('\nFalling back to keyboard navigation (Tab + Enter)...\n');

      // Fallback: Tab + Enter
      await page.keyboard.press('Tab');
      console.log('   → Tab pressed');
      await page.keyboard.press('Enter');
      console.log('   → Enter pressed');
      console.log('\n✅ Login submitted via keyboard fallback\n');

      return true;
    }

    if (result.success) {
      console.log(`✅ SMART DETECTION SUCCESSFUL`);
      console.log(`   Clicked button: "${result.text}"`);
      console.log(`   At position: (${result.x}, ${result.y})\n`);
      return true;
    }

    console.log('❌ Click failed\n');
    return false;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nAttempting keyboard fallback...\n');

    try {
      const pages = await browser?.pages() || [];
      if (pages.length > 0) {
        const page = pages[pages.length - 1];
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        console.log('✅ Fallback successful: Tab + Enter pressed\n');
        return true;
      }
    } catch (e) {
      console.error('Fallback also failed:', e.message);
    }

    return false;
  }
}

// Run the function
clickLoginButton().then((success) => {
  console.log('='.repeat(60));
  process.exit(success ? 0 : 1);
});
