import numpy as np

def solve_snakes_and_ladders(N, snakes, ladders, die_faces):
    """
    N          : number of squares on the board
    snakes     : dict of {head: tail}
    ladders    : dict of {foot: top}
    die_faces  : list of possible rolls e.g. [1,2] for coin, [1,2,3,4,5,6] for die
    """

    def move(square):
        if square in snakes:
            return snakes[square]
        if square in ladders:
            return ladders[square]
        return square

    p = 1 / len(die_faces)

    states = list(range(1, N))
    index  = {square: i for i, square in enumerate(states)}

    A = np.zeros((N - 1, N - 1))
    b = np.ones(N - 1)

    for square in states:
        A[index[square], index[square]] = 1.0
        for roll in die_faces:
            dest = move(square + roll) if square + roll <= N else square
            if dest < N:
                A[index[square], index[dest]] -= p

    k = np.linalg.solve(A, b)

    return k[index[1]]


# --- example: the question 9 board ---
N       = 9
snakes  = {6: 1, 8: 4}
ladders = {2: 7, 3: 5}
die     = [1, 2]

expected = solve_snakes_and_ladders(N, snakes, ladders, die)
print(f"Expected moves from square 1: {expected:.4f}")

# --- same board with a standard die ---
expected_d6 = solve_snakes_and_ladders(N, snakes, ladders, [1, 2, 3, 4, 5, 6])
print(f"Same board, standard die:     {expected_d6:.4f}")

# --- 10x10 standard board ---
N_100   = 100
snakes  = {16: 6,  47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78}
ladders = {1: 38,  4: 14,  9: 31,  20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91}
die_d6  = [1, 2, 3, 4, 5, 6]

expected_100 = solve_snakes_and_ladders(N_100, snakes, ladders, die_d6)
print(f"10x10 classic board:          {expected_100:.4f}")