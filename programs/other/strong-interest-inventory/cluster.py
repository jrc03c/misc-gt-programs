import json
import os
import time

import pandas as pd
import voyageai
from matplotlib import pyplot as plot
from numpy import array
from pyds import set, sort
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from tqdm import tqdm as progress


def load_json(path):
    with open(path) as file:
        return json.loads(file.read())


def save_json(path, data):
    with open(path, "w") as file:
        if not isinstance(data, str):
            data = json.dumps(data)

        file.write(data)


dir = ("/").join(__file__.split("/")[:-1])

secrets = load_json(os.path.join(dir, "secrets.json"))
VOYAGEAI_API_KEY = secrets["VOYAGEAI_API_KEY"]
VOYAGEAI_MODEL = "voyage-large-2-instruct"

strong = load_json(os.path.join(dir, "strong.json"))
items = []

for key in strong.keys():
    items += strong[key]["items"]

items = sort(set(items))

if os.path.exists(os.path.join(dir, "cluster/embeddings.json")):
    embeddings = load_json(os.path.join(dir, "cluster/embeddings.json"))

else:
    voyage = voyageai.Client(api_key=VOYAGEAI_API_KEY)
    embeddings = []
    index = 0
    batch_size = 128

    while len(embeddings) < len(items):
        print("fetching embeddings batch: {} - {}".format(index, index + batch_size))
        subset = items[index : index + batch_size]
        results = voyage.embed(subset, model=VOYAGEAI_MODEL, input_type="document")
        embeddings += results.embeddings
        index += len(results.embeddings)
        time.sleep(3)

    save_json(os.path.join(dir, "cluster/embeddings.json"), embeddings)

if True:
    ks = list(range(1, 31))
    scores = []

    for k in progress(ks):
        model = KMeans(n_clusters=k)
        model.fit(embeddings)
        score = model.score(embeddings)
        scores.append(score)

    plot.plot(ks, scores)
    plot.xlabel("k")
    plot.ylabel("score")
    plot.savefig(os.path.join(dir, "cluster/cluster-scores.png"))
    plot.clf()

    df = pd.DataFrame({"k": ks, "score": scores})
    df.to_csv(os.path.join(dir, "cluster/cluster-scores.csv"), index=False)
    print(df)

if True:
    k = 17
    kmeans = KMeans(n_clusters=k, n_init=250)
    kmeans.fit(embeddings)
    labels = kmeans.predict(embeddings)

    tsne = TSNE(n_components=2)
    embeddings_2d = tsne.fit_transform(array(embeddings))

    data = []

    for i in range(0, len(items)):
        data.append(
            {
                "item": items[i],
                "embedding": embeddings[i],
                "2d": embeddings_2d[i],
                "label": labels[i],
            }
        )

    for label in sort(set(labels)):
        objs = list(filter(lambda obj: obj["label"] == label, data))
        points = [obj["2d"] for obj in objs]
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        plot.scatter(xs, ys, label=str(label))

    plot.legend()
    plot.title("clusters")
    plot.savefig(os.path.join(dir, "cluster/clusters.png"))
    plot.show()

    xs = [p[0] for p in embeddings_2d]
    ys = [p[1] for p in embeddings_2d]
    df = pd.DataFrame({"item": items, "x": xs, "y": ys, "label": labels})
    df.to_csv(os.path.join(dir, "cluster/clusters-2d.csv"), index=False)
    print(df)
