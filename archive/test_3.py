import numpy as np

def solve_snakes_and_ladders(N, snakes, ladders, die_faces):
    """
    N          : number of squares on the board
    snakes     : dict of {head: tail}
    ladders    : dict of {foot: top}
    die_faces  : list of possible rolls e.g. [1,2] for coin, [1,2,3,4,5,6] for die
    
    Returns: expected moves and standard deviation from square 1
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

    # build transition matrix P and system matrix A
    # A is the same for both solves: A = I - P
    P = np.zeros((N - 1, N - 1))

    for square in states:
        for roll in die_faces:
            dest = move(square + roll) if square + roll <= N else square
            if dest < N:
                P[index[square], index[dest]] += p

    A = np.eye(N - 1) - P

    # --- first moment: Ak = 1 ---
    b_first = np.ones(N - 1)
    k = np.linalg.solve(A, b_first)

    # --- second moment: Am = 1 + 2Pk ---
    b_second = np.ones(N - 1) + 2 * P @ k
    m = np.linalg.solve(A, b_second)

    # --- variance and standard deviation ---
    variance = m - k ** 2
    std      = np.sqrt(variance)

    mean_from_1 = k[index[1]]
    std_from_1  = std[index[1]]

    return mean_from_1, std_from_1


# --- example: the question 9 board ---
N       = 9
snakes  = {6: 1, 8: 4}
ladders = {2: 7, 3: 5}
die     = [1, 2]

mean, std = solve_snakes_and_ladders(N, snakes, ladders, die)
print(f"Expected moves: {mean:.4f}")
print(f"Std deviation:  {std:.4f}")

# --- 10x10 standard board ---
N_100   = 100
snakes  = {16: 6,  47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78}
ladders = {1: 38,  4: 14,  9: 31,  20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91}

mean_100, std_100 = solve_snakes_and_ladders(N_100, snakes, ladders, [1, 2, 3, 4, 5, 6])
print(f"\n10x10 classic board:")
print(f"Expected moves: {mean_100:.4f}")
print(f"Std deviation:  {std_100:.4f}")