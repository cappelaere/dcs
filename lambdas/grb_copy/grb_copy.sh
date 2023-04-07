#!/bin/sh
export AWS_PROFILE=oe
nohup python3 grb_copy.py > /dev/null 2>&1 &
