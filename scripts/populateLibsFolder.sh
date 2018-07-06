#!/bin/bash

f=()
f+=("socket.io-client/dist/socket.io.js")
f+=("p5/lib/p5.min.js")
f+=("p5/lib/addons/p5.sound.min.js")
f+=("p5/lib/addons/p5.dom.min.js")
f+=("jquery/dist/jquery.js")
f+=("three/build/three.min.js")

echo "mkdir -p libs"
mkdir -p libs

echo "cd node_modules"
cd node_modules

L="../libs/"
for item in ${f[*]}
do
    echo "cp $item $L"
    cp $item $L
done

