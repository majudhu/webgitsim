function fnv1a(m) {
  let h = 2166136261 ^ m.charCodeAt(0);

  while ((m = m.substring(1)) != "") {
    h = (h ^ m.charCodeAt(0)) * 16777619;
  }
  h = Math.abs(h) % 0x1000000;
  return h.toString(16);
}

var files = document.getElementById('files');
var head = document.getElementById('head');
var commits = document.getElementById('commits');
var trees = document.getElementById('trees');
var blobs = document.getElementById('blobs');
var txt_description = document.getElementById('txt_description');

function resetborders() {
  head.style.border = "none";
  for (let objects of [files, commits, trees, blobs]) {
    for (let object of objects.children) {
      object.style.border = "none";
      for (let content of object.children)
        content.style.border = "none";
    }
  }
}

function setborder(node) {
  node.style.border = "solid black medium";
}

head.addEventListener("mouseenter", function() {
  resetborders();
  setborder(head);
  for (let commit of commits.children) {
    if (commit.children[0].textContent == head.textContent) {
      setborder(commit);
      for (let tree of trees.children) {
        if (tree.children[0].textContent == commit.children[2].children[0].textContent) {
          setborder(tree);
          for (let blob of trees.children) {
            for (let file of files.children) {
              if (file.children[0].textContent == blob.children[0].textContent) {
                setborder(file);
              }
            }
          }
        }
      }
    }
  }
});

document.getElementById('btn_addfile').addEventListener('click', function() {
  let newfile = document.createElement('div');
  let hash = document.createElement('p');
  let filename = document.createElement('input');
  let content = document.createElement('input');

  newfile.className = "file";
  hash.className = "hash";

  hash.textContent = "6b1ec6";
  filename.value = "filename";
  content.value = "file content";

  content.addEventListener('input', function() {
    hash.textContent = fnv1a(content.value);
  });

  newfile.appendChild(hash);
  newfile.appendChild(filename);
  newfile.appendChild(content);
  newfile.addEventListener("mouseenter", function() {
    resetborders();
    setborder(newfile);
    for (let tree of trees.children) {
      for (let file of tree.children) {
        if (file.children[0] && file.children[0].textContent == hash.textContent) {
          setborder(file);
          for (let commit of commits.children) {
            if (commit.children[2].children[0].textContent == tree.children[0].textContent) {
              setborder(commit);
                if (commit.children[0].textContent == head.textContent) {
                  setborder(head);
                }
            }
          }
        }
      }
    }
    for (let blob of blobs.children) {
      if (blob.children[0].textContent == hash.textContent) {
        setborder(blob);
      }
    }
  });
  files.appendChild(newfile);
})

document.getElementById('btn_commit').addEventListener('click', function() {
  let newcommit = document.createElement('div');
  let newtree = document.createElement('div');
  let newtreehash = document.createElement('p');
  let oldblobs = [];
  let oldtrees = [];

    for (let blob of blobs.children) {
      oldblobs.push(blob.children[0].textContent);
  }
    for (let tree of trees.children) {
      oldtrees.push(tree.children[0].textContent);
    }

  newtree.className = "tree";
  newtreehash.className = "hash"

  newtree.appendChild(newtreehash);

  for (let file of files.children) {
    let newfile = document.createElement('p');
    let newfilehash = document.createElement('span');
    let newfilename = document.createTextNode(file.children[1].value);

    newfile.className = "content";
    newfilehash.textContent = file.children[0].textContent;

    newfile.appendChild(newfilehash);
    newfile.appendChild(newfilename);
    newtree.appendChild(newfile);

    if (!oldblobs.includes(file.children[0].textContent)) {
      let newblob = document.createElement('div');
      let newhash = document.createElement('p');
      let newcontent = document.createElement('p');

      newblob.className = "blob";
      newhash.className = "hash";
      newcontent.className = "content";

      newhash.textContent = file.children[0].textContent;
      newcontent.textContent = file.children[2].value;

      newblob.appendChild(newhash);
      newblob.appendChild(newcontent);

      blobs.appendChild(newblob);
      oldblobs.push(newhash.textContent);

      newblob.addEventListener("mouseenter", function() {
        resetborders();
        setborder(newblob);
        for (let file of files.children) {
          if (file.children[0].textContent == newblob.children[0].textContent) {
            setborder(file);
          }
        }
        for (let tree of trees.children) {
          for (let file of tree.children) {
            if (file.children[0] && file.children[0].textContent == newblob.children[0].textContent) {
              setborder(file);
              setborder(tree);
              for (let commit of commits.children) {
                if (commit.children[2].children[0].textContent == tree.children[0].textContent) {
                  setborder(commit);
                  if (head.textContent == commit.children[0].textContent) {
                    setborder(head);
                  }
                }
              }
            }
          }
        }
      });
    }
  }

  newtree.children[0].textContent = fnv1a(newtree.textContent);
  if (oldtrees.includes(newtree.children[0].textContent)) {
    for (let tree of trees.children) {
      if (tree.children[0].textContent == newtree.children[0].textContent) {
        newtree = tree;
      }
    }
  } else {
    trees.appendChild(newtree);
  }


  newcommit.appendChild(document.createElement('p'));
  newcommit.appendChild(document.createElement('p'));
  newcommit.appendChild(document.createElement('p'));
  newcommit.appendChild(document.createElement('p'));
  newcommit.appendChild(document.createElement('p'));
  newcommit.children[0].className = "hash";
  newcommit.children[1].className = "content";
  newcommit.children[2].className = "content";
  newcommit.children[3].className = "content";
  newcommit.children[4].className = "content";
  newcommit.children[1].textContent = "parent";
  newcommit.children[1].appendChild(document.createElement('span'));
  newcommit.children[1].children[0].textContent = head.textContent;
  newcommit.children[2].textContent = "tree";
  newcommit.children[2].appendChild(document.createElement('span'));
  newcommit.children[2].children[0].textContent = newtree.children[0].textContent;
  newcommit.children[3].textContent = "author: name";
  newcommit.children[4].textContent = "comment: " + txt_description.value;
  newcommit.children[0].textContent = fnv1a(newcommit.textContent);

  newcommit.addEventListener("mouseenter", function() {
    resetborders();
    setborder(newcommit);
    setborder(newtree);
    if (newcommit.children[0].textContent == head.textContent) {
      setborder(head);
    }
    for (let commit of commits.children) {
      if (commit.children[0].textContent == newcommit.children[1].children[0].textContent) {
        setborder(commit);
      }
    }
    for (let file of newtree.children) {
      if (file.children[0]) {
        for (let blob of blobs.children) {
          if (file.children[0].textContent == blob.children[0].textContent) {
            setborder(blob);
          }
        }
      }
    }
  });

  newtree.addEventListener("mouseenter", function() {
    resetborders();
    setborder(newtree);
    if (newcommit.children[0].textContent == head.textContent) {
      setborder(head);
    }
    for (let commit of commits.children) {
      if (commit.children[2].children[0].textContent == newtree.children[0].textContent) {
        setborder(commit);
      }
    }
    for (let file of newtree.children) {
      if (file.children[0]) {
        for (let blob of blobs.children) {
          if (file.children[0].textContent == blob.children[0].textContent) {
            setborder(blob);
          }
        }
      }
    }
  });

  commits.appendChild(newcommit);
  head.textContent = newcommit.children[0].textContent;
});
