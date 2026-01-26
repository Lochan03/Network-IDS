import asyncio
import time
import websockets

async def listen_once(uri, recv_time=8):
    async with websockets.connect(uri) as websocket:
        print(f'Connected to {uri}')
        try:
            # listen for messages for a limited time
            async for msg in websocket:
                print('MSG:', msg)
        except asyncio.CancelledError:
            pass

async def try_connect_with_retry(uri='ws://localhost:8765', timeout=10):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            await asyncio.wait_for(listen_once(uri), timeout=timeout)
            return
        except Exception as e:
            # retry quickly
            # print a short message but keep retrying until deadline
            print('Retry/connect error (will retry):', e)
            await asyncio.sleep(0.3)

if __name__ == '__main__':
    try:
        asyncio.run(try_connect_with_retry(timeout=12))
    except Exception as e:
        print('Client exited with error:', e)