# 워홀로그 v6 적합도 계산 검증용 엔진
# 환율 가정(만원 환산): USD 0.14, EUR 0.15, GBP 0.185, AUD 0.09, NZD 0.082, CAD 0.10,
# DKK 0.02, SEK 0.0135, CZK 0.006, HUF 0.00039, PLN 0.035, HKD 0.018, KRW 1
# 항공권 가정(왕복 기준, D-094): 아시아 40, 유럽·오세아니아·북미 150, 남미 250 (만원)
# need = 재정증명 + 비자비용 + 보건부담금(영국) + 항공권 (만원). 3단계: DB 계산값으로 맞춤(D-085). None = 확인 중(잔고 증명 숫자 없음) → '돈' 항목을 점수에서 뺌
C = {
 # name: age, eng, langs, local_req, no_fulltime, emp_limit, job_hard, wage, price, kor, study, long2, europe, near, select, need
 '호주':      (35,'Y',[],0,0,1,0,'상','높음','많음',4,'Y',0,0,'무제한',676),
 '뉴질랜드':  (30,'Y',[],0,0,0,0,'상','높음','많음',6,'P',0,0,'선착순',558),
 '캐나다':    (35,'Y',['프랑스어'],0,0,0,0,'상','높음','많음',6,'Y',0,0,'추첨',428),
 '영국':      (35,'Y',[],0,0,0,0,'상','높음','많음',99,'Y',1,0,'선착순',968),
 '아일랜드':  (34,'Y',[],0,1,0,1,'상','높음','적음',6,'N',1,0,'추첨',None),
 '일본':      (30,'N',['일본어'],0,0,0,0,'중','중간','많음',3,'Y',0,1,'선착순',320),
 '대만':      (34,'N',['중국어'],0,0,0,0,'하','낮음','중간',3,'P',0,1,'선착순',340),
 '홍콩':      (30,'H',['광둥어'],0,0,1,0,'하','중간','중간',6,'N',0,1,'선착순',400),
 '프랑스':    (35,'N',['프랑스어'],0,0,0,0,'상','중간','중간',0,'N',1,0,'선착순',525),
 '독일':      (34,'N',['독일어'],0,0,0,0,'상','중간','많음',99,'N',1,0,'무제한',536),
 '이탈리아':  (30,'N',['이탈리아어'],0,0,1,0,'없음','중간','적음',None,'N',1,0,'선착순',1800),
 '스페인':    (30,'N',['스페인어'],1,0,0,1,'중','중간','적음',None,'N',1,0,'선착순',None),
 '네덜란드':  (30,'N',['네덜란드어'],0,0,0,0,'상','중간','중간',None,'N',1,0,'선착순',163),
 '벨기에':    (30,'N',['네덜란드어','프랑스어','독일어'],0,1,1,0,'상','중간','중간',6,'N',1,0,'선착순',557),
 '룩셈부르크':(35,'N',['프랑스어','독일어'],1,1,0,1,'상','높음','적음',None,'N',1,0,'선착순',563),
 '오스트리아':(30,'N',['독일어'],0,1,0,0,'없음','중간','적음',None,'N',1,0,'선착순',None),
 '포르투갈':  (34,'N',['포르투갈어'],1,1,0,0,'하','낮음','적음',None,'N',1,0,'선착순',None),
 '덴마크':    (34,'N',['덴마크어'],0,1,0,0,'없음','높음','중간',6,'N',1,0,'무제한',511),
 '스웨덴':    (30,'N',['스웨덴어'],1,0,0,1,'없음','높음','중간',99,'N',1,0,'무제한',373),
 '체코':      (30,'N',['체코어'],0,0,0,0,'하','낮음','적음',None,'N',1,0,'선착순',897),
 '헝가리':    (30,'N',['헝가리어'],0,1,0,0,'하','낮음','중간',None,'N',1,0,'선착순',580),
 '폴란드':    (30,'N',['폴란드어'],0,0,0,0,'중','낮음','적음',None,'N',1,0,'선착순',None),
 '라트비아':  (34,'N',['라트비아어'],0,1,0,0,'하','낮음','적음',None,'N',1,0,'선착순',497),
 '아르헨티나':(34,'N',['스페인어'],0,0,0,0,'하','낮음','중간',None,'N',0,0,'선착순',600),
 '칠레':      (30,'N',['스페인어'],1,0,0,1,'하','낮음','적음',None,'N',0,0,'무제한',670),
 '브라질':    (34,'N',['포르투갈어'],0,0,0,0,'하','낮음','많음',None,'N',0,0,'선착순',544),
 '이스라엘':  (30,'N',['히브리어'],0,0,1,0,'중','높음',None,6,'N',0,0,'선착순',None),
 '안도라':    (30,'N',['카탈루냐어'],0,0,0,0,'중',None,'적음',None,'N',1,0,'선착순',773),
}
TWICE = {'캐나다','일본'}
V = {'Y':1,'P':.5,'N':0}

P={
 'A Yvonne(33,독일어,사무·호텔,돈·일자리·2년)':dict(age=33,visited={'호주','캐나다','독일'},budget=500,eng=3,langs=['독일어'],jobs=['사무','호텔'],earn='꼭',study=0,prio=['돈','일자리','2년']),
 'B 27세 일본 고민(영어 주문 정도, 어학원 3개월, 가까운·생활비·일자리)':dict(age=27,visited=set(),budget=600,eng=1,langs=[],jobs=['카페'],earn='꼭',study=3,prio=['가까운','생활비','일자리']),
 'C 23세 학생(영어 면접, 농장OK, 어학원 6개월, 돈·영어·2년)':dict(age=23,visited=set(),budget=800,eng=2,langs=[],jobs=['카페','농장'],earn='꼭',study=6,prio=['돈','영어','2년']),
 'D 33세 커리어(영어 업무, 1500만, 커리어·영어·유럽)':dict(age=33,visited=set(),budget=1500,eng=3,langs=[],jobs=['사무'],earn='일부',study=0,prio=['커리어','영어','유럽']),
 'E 29세 영어 거의 못함(300만, 한국인많은·생활비·확실)':dict(age=29,visited=set(),budget=300,eng=0,langs=[],jobs=['카페','리테일'],earn='꼭',study=0,prio=['한국인많은','생활비','확실']),
 'F 25세 스페인어 가능(유럽·생활비·한국인적은)':dict(age=25,visited=set(),budget=500,eng=1,langs=['스페인어'],jobs=['호텔'],earn='일부',study=0,prio=['유럽','생활비','한국인적은']),
}

EMP3={'이스라엘'}  # 한 고용주 3개월만 실제 제한으로 계산 (6개월 제한은 표시만)
def score(p):
    out=[]
    for n,(age,eng,langs,lreq,noft,emp,hard,wage,price,kor,study,long2,eu,near,sel,need) in C.items():
        if p['age']>age: continue
        if n in p['visited'] and n not in TWICE: continue
        emp = n in EMP3
        items=[]
        if need is not None:
            d=need-p['budget']; items.append(('돈',3,1 if d<=0 else .5 if d<=200 else 0))
        speaks=any(l in p['langs'] for l in langs)
        if speaks or (eng=='Y' and p['eng']>=2): lang=1
        elif (eng in 'NH' and p['eng']>=3 and not lreq) or (eng=='H' and p['eng']>=2) or (eng=='Y' and p['eng']<=1): lang=.5
        else: lang=0
        items.append(('언어',3,lang))
        w={'꼭':3,'일부':1.5,'안':0}[p['earn']]
        office='사무' in p['jobs']
        if lang==1: work=.5 if ((office and noft) or emp or hard) else 1
        elif lang==.5: work=.5
        else: work=.5 if kor=='많음' else 0
        if w: items.append(('일',w,work))
        if p['study'] and study is not None:
            items.append(('어학원',1.5,1 if study>=p['study'] else 0))
        for pr in p['prio']:
            if pr=='돈': m=1 if wage=='상' and not noft else .5 if wage in('상','중','없음') else 0
            elif pr=='일자리':
                f=(lang!=1)+(noft or emp)+hard; m=1 if f==0 else .5 if f==1 else 0
            elif pr=='영어': m=1 if eng=='Y' else .5 if eng=='H' else 0
            elif pr=='커리어': m=0 if lang!=1 else .5 if noft else 1
            elif pr=='2년':
                m=V[long2]
                if n=='호주' and '농장' not in p['jobs']: m=.5
            elif pr=='유럽': m=eu
            elif pr=='생활비':
                if price is None: continue
                m={'낮음':1,'중간':.5,'높음':0}[price]
            elif pr=='확실': m={'무제한':1,'선착순':.5,'추첨':0}[sel]
            elif pr=='한국인적은':
                if kor is None: continue
                m={'적음':1,'중간':.5,'많음':0}[kor]
            elif pr=='한국인많은':
                if kor is None: continue
                m={'많음':1,'중간':.5,'적음':0}[kor]
            elif pr=='가까운': m=near
            items.append((pr,1.5,m))
        tot=sum(w for _,w,_ in items); got=sum(w*m for _,w,m in items)
        pct=round(got/tot*100)
        flag=''
        if p['earn']=='꼭' and work==0: pct=min(pct,59); flag='일하며 지내기 어려움'
        if sel=='추첨': flag=(flag+' ' if flag else '')+'추첨'
        ok=sum(1 for _,_,m in items if m==1)
        ess=sum(w*m for a,w,m in items if a in('돈','언어','일'))
        out.append((pct,ok,ess,n,len(items),items,flag))
    return sorted(out,key=lambda x:(-x[0],-x[1],-x[2],x[3]))  # 동점은 이름(가나다)순 (D-089)
if __name__=='__main__':
    import statistics
    for k,p in P.items():
        r=score(p)
        print('\n'+k,f'(후보 {len(r)})')
        for pct,ok,ess,n,cnt,items,flag in r[:5]:
            print(f'  {pct:3d}% {n} ({ok}/{cnt}✓) {flag} | '+' '.join(f"{a}:{'✓' if m==1 else '△' if m==.5 else '✗'}" for a,_,m in items))
        ps=[x[0] for x in r]
        print('  하위:',', '.join(f'{x[3]} {x[0]}%' for x in r[-3:]), f'| 1·2위 차 {ps[0]-ps[1]}%p, 중앙값 {statistics.median(ps)}%')
