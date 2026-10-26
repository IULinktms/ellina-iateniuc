import json,sys,os
root,edits=sys.argv[1],sys.argv[2]
E=json.load(open(edits,encoding='utf-8')); bad=0
for x in E:
    p=os.path.join(root,x['file']); s=open(p,encoding='utf-8').read()
    n=s.count(x['old'])
    if n!=1: print('SEQ COUNT',n,x['file'],x['old'][:80]); bad+=1; continue
    open(p,'w',encoding='utf-8').write(s.replace(x['old'],x['new']))
print('applied',len(E)-bad,'bad',bad)
