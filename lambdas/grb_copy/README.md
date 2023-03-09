# GRB_copy

Lambda to copy GRB data from GeoCloud to Prototype are.
There are actually two copies of it as we need two subscriptions
- L1B for ABI, MAG, SEIS, SUVI, EXIS
- L2 for GLM

dcs_goes.py is actually a client application that needs to be runnin gon the prototype side.
to run it, detached from the terminal:

```
nohup python dcs_grb.py > /dev/null 2>&1 &
 ```