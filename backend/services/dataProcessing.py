import numpy as np

finger_path = [[0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], [0,13,14,15,16], [0,17,18,19,20]]

#JSON 데이터를 벡터로 변환
def json_vector(json_data):
    vector = []
    for path in finger_path:
        for i in range(0, len(path)-1):
            start = path[i]
            end = path[i+1]

            dx = json_data[end]['x'] - json_data[start]['x']
            dy = json_data[end]['y'] - json_data[start]['y']
            dz = json_data[end]['z'] - json_data[start]['z']

            vector.append([dx, dy, dz])

    return np.array(vector).flatten()