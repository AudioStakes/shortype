import { render, waitForElementToBeRemoved, waitFor, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';

import GameView from '../src/views/GameView.vue';
import Keyboard from '../src/keyboard';

const shortcuts = [
  {
    app: 'Google Chrome',
    os: 'macOS',
    category: 'タブとウィンドウのショートカット',
    action: '最後のタブに移動する',
    shortcut: '⌘+9',

    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: '9',

    isAvailable: true,
  },
  {
    app: 'Google Chrome',
    os: 'macOS',
    category: 'タブとウィンドウのショートカット',
    action: 'ウィンドウを最小化する',
    shortcut: '⌘+m',

    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'm',

    isAvailable: true,
  },
];

beforeAll(() => {
  vi.spyOn(Keyboard.prototype, 'key').mockImplementation(({ key }) => key); // テストでは key の値を指定しており、修飾キーの状態やキーボードレイアウトによる key の値の変化が生じないため
});

test('show a question', () => {
  const { getByText } = render(GameView, { props: { shortcuts: shortcuts } });

  getByText('Google Chrome | タブとウィンドウのショートカット');
  getByText('最後のタブに移動する');
});

test('show a pressed key combination', async () => {
  const { getByTestId } = render(GameView, { props: { shortcuts: shortcuts } });

  await userEvent.keyboard('{Meta>}{A}');

  const pressedKeyCombination = getByTestId('pressed-key-combination');

  within(pressedKeyCombination).getByTestId('Meta');
  within(pressedKeyCombination).getByTestId('a');
});

test('proceed to a next question when the correct key is pressed', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: shortcuts },
  });

  getByText('最後のタブに移動する');

  await userEvent.keyboard('{Meta>}{9}'); // 正解を入力
  await waitForElementToBeRemoved(getByTestId('check-circle-icon')); // 正解アイコンが非表示になるまで待つ

  getByText('ウィンドウを最小化する'); // 次の質問
});

test('show a correct answer when a wrong key is pressed', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: shortcuts },
  });

  getByText('最後のタブに移動する');

  await userEvent.keyboard('{Meta>}{A}'); // 不正解を入力

  getByTestId('correct-key-combination'); // 正解が表示
});

test('proceed to a next question when the correct key is pressed after a wrong key', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: shortcuts },
  });

  getByText('最後のタブに移動する');

  await userEvent.keyboard('{Meta>}{A}'); // 不正解を入力
  await waitFor(() => getByText('ショートカットキーを入力してください...')); // 不正解入力時のアニメーションの終了を待つ
  await userEvent.keyboard('{Meta>}{9}'); // 正解を入力
  await waitForElementToBeRemoved(getByTestId('check-icon')); // 正解アイコンが非表示になるまで待つ

  getByText('ウィンドウを最小化する');
});

test('skip a question when an Enter key is pressed', async () => {
  const { getByText } = render(GameView, { props: { shortcuts: shortcuts } });

  getByText('最後のタブに移動する');

  await userEvent.keyboard('{Enter}');

  getByText('ウィンドウを最小化する');
});
