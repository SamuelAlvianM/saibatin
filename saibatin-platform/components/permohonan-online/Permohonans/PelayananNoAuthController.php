<?php

namespace App\Http\Controllers\Fronts\Permohonans;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use DB;
use Auth;

class PelayananNoAuthController extends Controller
{   
    public function __construct()
    {
        
    }

    function gettot() {
       
        $whr1   = '1=1';
        $data  = DB::query()
            ->selectRaw('
                z1.prg_sts
                , count(z1.nomorPermohonan) as plyn_tot
            ')
            ->fromSub(
                function ($query) use($whr1) {
                    $query
                        ->selectRaw('y1.prg_sts, y1.nomorPermohonan')
                        ->fromSub(
                            DB::table('t_kelahiran_1 as x1')
                            ->selectRaw('
                                x1.nomorPermohonan
                                , x1.progress_status as prg_sts
                                , x1.created_by
                            ')
                            ->where([
                                ['status','=','1']
                            ])
                            // ->whereRaw('date(x1.created_at)=curdate()')
                            ->unionAll(
                                DB::table('t_kelahiran_2 as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kematian as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kk as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kia as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_perkawinan as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_perceraian as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_pindah as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kedatangan as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_ktpel as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kk_tambahanak as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kk_pisahkk as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kk_numpang as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kk_perubahanbiodata as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_kk_cetakulang as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ->unionAll(
                                DB::table('t_konsolidasiupdatedata as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    // ->whereRaw('date(x1.created_at)=curdate()')
                            )
                            ,'y1'
                        )
                        ->joinSub(
                            function ($query) {
                                $query
                                    ->from('users as x1')
                                    ->selectRaw('
                                        x1.id
                                        , x1.userlevel_id as userlevel
                                    ')
                                ;
                            }, 'y2'
                            , function($join) {
                                $join->on('y1.created_by', '=', 'y2.id');
                            }
                        )
                     ;
                }, 'z1'
            )
            ->groupBy('z1.prg_sts')
        ;

        $res= $data->get();
        return $res;
    }

    function gettotalldate() {
        $auth   = Auth::user();

        $whr1   = '';
        if($auth):
            $sessid = $auth->id;
            $sessnik= $auth->user_nik;
            $sesskk = $auth->user_nokk;
            $sessulvid = $auth->userlevel_id;

            if($sessulvid==3 || $sessulvid==41):
                $whr1   = 'x1.created_by='.$sessid;
            elseif($sessulvid==2 || $sessulvid==4):
                $whr1   = '1=1';
            endif;
        else:
            $whr1   = '1=1';
        endif;

        $data  = DB::query()
            ->selectRaw('
                z1.prg_sts
                , count(z1.nomorPermohonan) as plyn_tot
            ')
            ->fromSub(
                function ($query) use($whr1) {
                    $query
                        ->selectRaw('y1.prg_sts, y1.nomorPermohonan')
                        ->fromSub(
                            DB::table('t_kelahiran_1 as x1')
                            ->selectRaw('
                                x1.nomorPermohonan
                                , x1.progress_status as prg_sts
                                , x1.created_by
                            ')
                            ->where([
                                ['status','=','1']
                            ])
                            ->whereRaw($whr1)
                            ->unionAll(
                                DB::table('t_kelahiran_2 as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kematian as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kk as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kia as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_perceraian as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_perkawinan as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_pindah as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kedatangan as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_ktpel as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kk_tambahanak as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kk_pisahkk as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kk_numpang as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kk_perubahanbiodata as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_kk_cetakulang as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ->unionAll(
                                DB::table('t_konsolidasiupdatedata as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , x1.progress_status as prg_sts
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                            )
                            ,'y1'
                        )
                        ->joinSub(
                            function ($query) {
                                $query
                                    ->from('users as x1')
                                    ->selectRaw('
                                        x1.id
                                        , x1.userlevel_id as userlevel
                                    ')
                                ;
                            }, 'y2'
                            , function($join) {
                                $join->on('y1.created_by', '=', 'y2.id');
                            }
                        )
                     ;
                }, 'z1'
            )
            ->groupBy('z1.prg_sts')
        ;

        $res= $data->get();
        return $res;
    }

    function gettotalbyjenispelayananpie(Request $request) {
        $auth   = Auth::user();

        $whr1   = '';
        if($auth):
            $sessid = $auth->id;
            $sessnik= $auth->user_nik;
            $sesskk = $auth->user_nokk;
            $sessulvid = $auth->userlevel_id;

            if($sessulvid==3 || $sessulvid==41):
                $whr1   = 'x1.created_by='.$sessid;
            elseif($sessulvid==2 || $sessulvid==4):
                $whr1   = '1=1';
            endif;
        else:
            $whr1   = '1=1';
        endif;
        $whr2 = ($request->get('prm1')==9)?'1=1':'x1.progress_status='.$request->get('prm1');
        $data  = DB::query()
            ->selectRaw('a1.*')
            ->fromSub(
                DB::query()
                ->selectRaw('
                    z1.jenisPermohonan
                    , count(z1.nomorPermohonan) as plyn_tot
                ')
                ->fromSub(
                    function ($query) use($sessulvid,$whr1,$whr2) {
                        $query
                            ->selectRaw('y1.jenisPermohonan, y1.nomorPermohonan')
                            ->fromSub(
                                DB::table('t_kelahiran_1 as x1')
                                ->selectRaw('
                                    x1.nomorPermohonan
                                    , \'Akta Kelahiran (Tidak Ada NIK)\' as jenisPermohonan
                                    , x1.created_by
                                ')
                                ->where([
                                    ['status','=','1']
                                ])
                                ->whereRaw($whr1)
                                ->whereRaw($whr2)
                                ->unionAll(
                                    DB::table('t_kelahiran_2 as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kematian as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Kematian\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kia as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Kartu Identitas Anak\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_perceraian as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Akta Perceraian\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_perkawinan as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Akta Perkawinan\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_pindah as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            ,  \'Perpindahan\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kedatangan as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Kedatangan\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_ktpel as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'KTP-El\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_tambahanak as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'KK Tambah Anak\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_pisahkk as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Pisah KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_numpang as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Numpang KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_perubahanbiodata as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Perubahan Biodata KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_cetakulang as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Cetak Ulang\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_konsolidasiupdatedata as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Konsolidasi Update Data\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ,'y1'
                            )
                            ->joinSub(
                                function ($query) {
                                    $query
                                        ->from('users as x1')
                                        ->selectRaw('
                                            x1.id
                                            , x1.userlevel_id as userlevel
                                        ')
                                    ;
                                }, 'y2'
                                , function($join) {
                                    $join->on('y1.created_by', '=', 'y2.id');
                                }
                            )
                         ;
                    }, 'z1'
                )
                ->groupBy('z1.jenisPermohonan')
                ,'a1'
            )
            ->orderBy('a1.plyn_tot','desc')
        ;

        $res= $data->get();
        $tmp_1  = [];
        for ($i=0; $i<count($res); $i++) { 
            $tmp_2  = [];
            array_push($tmp_2,$res[$i]->jenisPermohonan);
            array_push($tmp_2,$res[$i]->plyn_tot);
            array_push($tmp_1,$tmp_2);
        }
        $dataset= $tmp_1;
        return $dataset;
    }

    function gettotalbyjenispelayananbar(Request $request) {
        $auth   = Auth::user();

        $whr1   = '';
        if($auth):
            $sessid = $auth->id;
            $sessnik= $auth->user_nik;
            $sesskk = $auth->user_nokk;
            $sessulvid = $auth->userlevel_id;

            if($sessulvid==3 || $sessulvid==41):
                $whr1   = 'x1.created_by='.$sessid;
            elseif($sessulvid==2 || $sessulvid==4):
                $whr1   = '1=1';
            endif;
        else:
            $whr1   = '1=1';
        endif;

        $whr2 = ($request->get('prm1')==9)?'1=1':'x1.progress_status="'.$request->get('prm1').'"';
        $data  = DB::query()
            ->selectRaw('a1.*')
            ->fromSub(
                DB::query()
                ->selectRaw('
                    z1.jenisPermohonan
                    , count(z1.nomorPermohonan) as plyn_tot
                ')
                ->fromSub(
                    function ($query) use($sessulvid,$whr1,$whr2) {
                        $query
                            ->selectRaw('y1.jenisPermohonan, y1.nomorPermohonan')
                            ->fromSub(
                                DB::table('t_kelahiran_1 as x1')
                                ->selectRaw('
                                    x1.nomorPermohonan
                                    , \'Akta Kelahiran (Tidak Ada NIK)\' as jenisPermohonan
                                    , x1.created_by
                                ')
                                ->where([
                                    ['status','=','1']
                                ])
                                ->whereRaw($whr1)
                                ->whereRaw($whr2)
                                ->unionAll(
                                    DB::table('t_kelahiran_2 as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kematian as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Kematian\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kia as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Kartu Identitas Anak\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_perceraian as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Akta Perceraian\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_perkawinan as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Akta Perkawinan\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_pindah as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            ,  \'Perpindahan\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kedatangan as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Kedatangan\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_ktpel as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'KTP-El\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_tambahanak as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'KK Tambah Anak\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_pisahkk as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Pisah KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_numpang as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Numpang KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_perubahanbiodata as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Perubahan Biodata KK\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_kk_cetakulang as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Cetak Ulang\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ->unionAll(
                                    DB::table('t_konsolidasiupdatedata as x1')
                                        ->selectRaw('
                                            x1.nomorPermohonan
                                            , \'Konsolidasi Update Data\' as jenisPermohonan
                                            , x1.created_by
                                        ')
                                        ->where([
                                            ['status','=','1']
                                        ])
                                        ->whereRaw($whr1)
                                        ->whereRaw($whr2)
                                )
                                ,'y1'
                            )
                            ->joinSub(
                                function ($query) {
                                    $query
                                        ->from('users as x1')
                                        ->selectRaw('
                                            x1.id
                                            , x1.userlevel_id as userlevel
                                        ')
                                    ;
                                }, 'y2'
                                , function($join) {
                                    $join->on('y1.created_by', '=', 'y2.id');
                                }
                            )
                         ;
                    }, 'z1'
                )
                ->groupBy('z1.jenisPermohonan')
                ,'a1'
            )
            ->orderBy('a1.plyn_tot','desc')
        ;
        $res= $data->get();
        $tmp_1  = [];
        for ($i=0; $i<count($res); $i++) { 
            $tmp_1['name'][$i] = $res[$i]->jenisPermohonan;
            $tmp_1['val'][$i] = $res[$i]->plyn_tot;
        }
        $dataset= $tmp_1;
        return $dataset;
    }
}