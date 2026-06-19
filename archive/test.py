import numpy as np

N = 9
snakes  = {6: 1, 8: 4}
ladders = {2: 7, 3: 5}

def move(square):
    if square in snakes:
        return snakes[square]
    if square in ladders:
        return ladders[square]
    return square

states = list(range(1, N))
index  = {square: i for i, square in enumerate(states)}

A = np.zeros((N - 1, N - 1))
b = np.ones(N - 1)

for square in states:
    A[index[square], index[square]] = 1.0
    for roll in [1, 2]:
        dest = move(square + roll) if square + roll <= N else square
        if dest < N:
            A[index[square], index[dest]] -= 0.5

k = np.linalg.solve(A, b)

for square, ki in zip(states, k):
    print(f"k_{square} = {ki:.4f}")